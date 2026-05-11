// Patched version of @adminjs/mongoose/lib/property.js
// Fix: Mongoose v9 DocumentArrayPath (e.g. [{ type: ObjectId, ref: 'X' }]) can have
// caster === undefined. The original code crashes on `let { instance } = this.mongoosePath.caster`
// and `this.mongoosePath.caster.options?.ref` when caster is undefined.
// Applied via: backend/scripts/apply-patches.js (run as postinstall)

import { BaseProperty } from 'adminjs';
const ID_PROPERTY = '_id';
const VERSION_KEY_PROPERTY = '__v';
class Property extends BaseProperty {
    // TODO: Fix typings
    mongoosePath;
    constructor(path, position = 0) {
        super({ path: path.path, position });
        this.mongoosePath = path;
    }
    instanceToType(mongooseInstance) {
        switch (mongooseInstance) {
            case 'String':
                return 'string';
            case 'Boolean':
                return 'boolean';
            case 'Number':
                return 'number';
            case 'Date':
                return 'datetime';
            case 'Embedded':
                return 'mixed';
            case 'ObjectID':
            case 'ObjectId':
                if (this.reference()) {
                    return 'reference';
                }
                return 'id';
            case 'Decimal128':
                return 'float';
            default:
                return 'string';
        }
    }
    name() {
        return this.mongoosePath.path;
    }
    isEditable() {
        return this.name() !== VERSION_KEY_PROPERTY && this.name() !== ID_PROPERTY;
    }
    reference() {
        // PATCH: guard against undefined caster (Mongoose v9 DocumentArrayPath)
        const ref = this.isArray()
            ? this.mongoosePath.caster?.options?.ref
            : this.mongoosePath.options?.ref;
        if (typeof ref === 'function')
            return ref.modelName;
        return ref;
    }
    isVisible() {
        return this.name() !== VERSION_KEY_PROPERTY;
    }
    isId() {
        return this.name() === ID_PROPERTY;
    }
    availableValues() {
        return this.mongoosePath.enumValues?.length ? this.mongoosePath.enumValues : null;
    }
    isArray() {
        return this.mongoosePath.instance === 'Array';
    }
    subProperties() {
        if (this.type() === 'mixed') {
            const subPaths = Object.values(this.mongoosePath.caster.schema.paths);
            return subPaths.map((p) => new Property(p));
        }
        return [];
    }
    type() {
        if (this.isArray()) {
            // PATCH: guard against undefined caster (Mongoose v9 DocumentArrayPath)
            const caster = this.mongoosePath.caster;
            if (!caster) return 'string';
            let { instance } = caster;
            // For array of embedded schemas mongoose returns null for caster.instance
            // That is why we have to check if caster has a schema
            if (!instance && caster.schema) {
                instance = 'Embedded';
            }
            return this.instanceToType(instance);
        }
        return this.instanceToType(this.mongoosePath.instance);
    }
    isSortable() {
        return this.type() !== 'mixed' && !this.isArray();
    }
    isRequired() {
        return !!this.mongoosePath.validators?.find?.((validator) => validator.type === 'required');
    }
}
export default Property;

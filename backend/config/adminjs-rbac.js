const bcrypt = require("bcryptjs");
const { SYSTEM_USER_ROLES } = require("../models/SystemUser");

const RESOURCE_DOMAIN = {
  systemUser: null,
  user: "user",
  note: "notes",
  chatSession: "chat",
  chatMessage: "chat",
  systemStats: "stats",
  maintenance: null,
};

const canRead = (currentAdmin, domain) => {
  if (!currentAdmin) {
    return false;
  }
  if (currentAdmin.role === "root") {
    return true;
  }
  if (!domain) {
    return false;
  } // null domain = root only
  const role = currentAdmin.role;
  return (
    role === `${domain}SuperAdmin` ||
    role === `${domain}Supervisor` ||
    role === `${domain}Manager` ||
    role === `${domain}PowerUser`
  );
};

const canCreate = (currentAdmin, domain) => {
  if (!currentAdmin) {
    return false;
  }
  if (currentAdmin.role === "root") {
    return true;
  }
  if (!domain) {
    return false;
  }
  const role = currentAdmin.role;
  return (
    role === `${domain}SuperAdmin` ||
    role === `${domain}Manager` ||
    role === `${domain}PowerUser`
  );
};

const canUpdate = (currentAdmin, domain) => {
  return canCreate(currentAdmin, domain);
};

const canDelete = (currentAdmin, domain) => {
  if (!currentAdmin) {
    return false;
  }
  if (currentAdmin.role === "root") {
    return true;
  }
  if (!domain) {
    return false;
  }
  const role = currentAdmin.role;
  return role === `${domain}SuperAdmin` || role === `${domain}PowerUser`;
};

const hashPasswordBeforeHook = async (request) => {
  if (request.method === "post" && request.payload?.password) {
    request.payload.password = await bcrypt.hash(request.payload.password, 12);
  }
  if (
    request.method === "post" &&
    !request.payload?.password &&
    request.action?.name !== "new"
  ) {
    // On edit: if password field is blank, remove it so we don't overwrite with empty
    delete request.payload?.password;
  }
  return request;
};

const maskPasswordAfterHook = async (response) => {
  if (response.record?.params?.password) {
    response.record.params.password = "••••••••";
  }
  return response;
};

const maskPasswordListAfterHook = async (response) => {
  if (response.records) {
    response.records.forEach((record) => {
      if (record.params?.password) record.params.password = "••••••••";
    });
  }
  return response;
};

const buildResourceConfig = (resourceKey, Model) => {
  const domain = RESOURCE_DOMAIN[resourceKey];

  const isAccessible =
    (action) =>
    ({ currentAdmin }) => {
      switch (action) {
        case "list":
        case "show":
        case "search":
          return canRead(currentAdmin, domain);
        case "new":
          return canCreate(currentAdmin, domain);
        case "edit":
          return canUpdate(currentAdmin, domain);
        case "delete":
          return canDelete(currentAdmin, domain);
        default:
          return currentAdmin?.role === "root";
      }
    };

  const baseConfig = {
    resource: Model,
    options: {
      actions: {
        list: { isAccessible: isAccessible("list") },
        show: { isAccessible: isAccessible("show") },
        new: { isAccessible: isAccessible("new") },
        edit: { isAccessible: isAccessible("edit") },
        delete: { isAccessible: isAccessible("delete") },
        search: { isAccessible: isAccessible("search") },
      },
    },
  };

  // Extra config per resource key

  if (resourceKey === "systemUser") {
    baseConfig.options.properties = {
      password: {
        isVisible: { list: false, filter: false, show: false, edit: true },
      },
      role: {
        availableValues: SYSTEM_USER_ROLES.map((r) => ({ value: r, label: r })),
      },
    };
    baseConfig.options.actions.new = {
      ...baseConfig.options.actions.new,
      before: [hashPasswordBeforeHook],
      after: [maskPasswordAfterHook],
    };
    baseConfig.options.actions.edit = {
      ...baseConfig.options.actions.edit,
      before: [hashPasswordBeforeHook],
      after: [maskPasswordAfterHook],
    };
    baseConfig.options.actions.show = {
      ...baseConfig.options.actions.show,
      after: [maskPasswordAfterHook],
    };
    baseConfig.options.actions.list = {
      ...baseConfig.options.actions.list,
      after: [maskPasswordListAfterHook],
    };
  }

  if (resourceKey === "user") {
    baseConfig.options.properties = {
      password: {
        isVisible: { list: false, filter: false, show: false, edit: true },
      },
    };
    baseConfig.options.actions.new = {
      ...baseConfig.options.actions.new,
      before: [hashPasswordBeforeHook],
      after: [maskPasswordAfterHook],
    };
    baseConfig.options.actions.edit = {
      ...baseConfig.options.actions.edit,
      before: [hashPasswordBeforeHook],
      after: [maskPasswordAfterHook],
    };
    baseConfig.options.actions.show = {
      ...baseConfig.options.actions.show,
      after: [maskPasswordAfterHook],
    };
    baseConfig.options.actions.list = {
      ...baseConfig.options.actions.list,
      after: [maskPasswordListAfterHook],
    };
  }

  if (resourceKey === 'maintenance') {
    baseConfig.options.actions.new    = { isAccessible: () => false };
    baseConfig.options.actions.delete = { isAccessible: () => false };
    baseConfig.options.listProperties = ['isActive', 'message', 'endsAt', 'activatedAt'];
    baseConfig.options.editProperties = ['isActive', 'message', 'endsAt', 'whitelistedIps'];
    baseConfig.options.showProperties = ['isActive', 'message', 'endsAt', 'activatedAt', 'whitelistedIps', 'updatedAt'];
  }

  return baseConfig;
};

module.exports = { buildResourceConfig };

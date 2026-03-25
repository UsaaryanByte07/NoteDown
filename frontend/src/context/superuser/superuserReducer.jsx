const superuserReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { isLoggedIn: true, superuser: action.payload.superuser };
    case "LOGOUT":
      return { isLoggedIn: false, superuser: null };
    default:
      return state;
  }
};

export default superuserReducer;
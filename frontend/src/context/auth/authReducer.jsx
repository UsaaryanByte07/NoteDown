const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        isLoggedIn: true,
        user: action.payload.user,
      };

    case "LOGOUT":
      return {
        isLoggedIn: false,
        user: null,
      };

    default:
      return state;
  }
};

export default authReducer;

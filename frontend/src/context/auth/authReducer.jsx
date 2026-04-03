const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload.user,
      };

    case "LOGOUT":
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };

    case "FINISH_INIT":
      return {
        ...state,
        isInitializing: false,
      };

    default:
      return state;
  }
};

export default authReducer;

import { createStore } from 'vuex';

const state = {
  error: null,
  user: null,
  registeruser: null,
};

const getters = {
  // global error
  error: (state) => {
    return state.error;
  },
  user: (state) => {
    return state.user;
  },
  registeruser: (state) => {
    return state.registeruser;
  },
};

const mutations = {
  setError(state, error) {
    state.error = error;
  },
  setUser(state, user) {
    state.user = user;
  },
  setRegisterUser(state, user) {
    state.registeruser = user;
  },
};

const actions = {
  setError({ commit }, error) {
    commit('setError', error);
  },
  setUser({ commit }, user) {
    commit('setUser', user);
  },
  setRegisterUser({ commit }, user) {
    commit('setRegisterUser', user);
  },
};

export const store = createStore({
  state,
  getters,
  actions,
  mutations,
});

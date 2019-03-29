import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    user: null,
    registeruser: null
}

const getters = {
    user: state => {
        return state.user
    },
    registeruser: state => {
        return state.registeruser
    }
}

const mutations = {
    setUser(state, user) {
        state.user = user
    },
    setRegisterUser(state, user) {
        state.registeruser = user
    }
}

const actions = {
    setUser({ commit }, user) {
        commit('setUser', user)
    },
    setRegisterUser({ commit }, user) {
        commit('setRegisterUser', user)
    }
}


export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations,
})

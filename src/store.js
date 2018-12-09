import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    user: null,
}

const getters = {
    user: state => {
        return state.user
    }
}

const mutations = {
    setUser(state, user) {
        state.user = user
    }
}

const actions = {
    setUser({ commit }, user) {
        commit('setUser', user)
    }
}


export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations,
})

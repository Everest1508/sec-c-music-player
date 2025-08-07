import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SearchResults from '@/views/SearchResultView.vue'
import PlaylistView from '@/views/PlaylistView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/search', component: SearchResults },
  { path: '/playlists', component: PlaylistView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

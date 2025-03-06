import { defineStore } from "pinia";

export const useSearchStore = defineStore('search', {
    state: () => ({
      results: []
    }),
    actions: {
      setResults(newResults) {
        this.results = newResults
      }
    }
  })
  
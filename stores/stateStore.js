import { create } from 'zustand'

export const Options = {
    NONE: "none",
    FIRE: "fire",
    RAIN: "rain",
}

const useStateStore = create((set) => ({
    activeOption: Options.NONE,
    setOption: (option) => set({ activeOption: option }),
    fires: 100,
    decrementFire: () => set((state) => ({ fires: state.fires - 1 })),
    rains: 100,
    decrementRain: () => set((state) => ({ rains: state.rains - 1 })),
}))


export default useStateStore;

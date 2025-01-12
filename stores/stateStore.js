import { create } from 'zustand'

export const Options = {
    NONE: "none",
    TREE: "tree",
    FIRE: "fire",
    RAIN: "rain",
}

const useStateStore = create((set) => ({
    activeOption: Options.NONE,
    setOption: (option) => set({ activeOption: option }),

    fires: 100,
    rains: 100,
    trees: 100,
    decrementFire: () => set((state) => ({ fires: state.fires - 1 })),
    decrementRain: () => set((state) => ({ rains: state.rains - 1 })),
    decrementTree: () => set((state) => ({ trees: state.trees - 1 })),
}));

export const useTreesStore = create((set) => ({
    numTrees: 0,
    addTree: (position, rotation) =>
        set((state) => ({
            numTrees: state.numTrees + 1,
            treesState: [...state.treesState, { position, rotation }],
        })),
    removeTree: (index) =>
        set((state) => {
            const updatedTreesState = [...state.treesState];
            updatedTreesState.splice(index, 1);
            return {
                numTrees: state.numTrees - 1,
                treesState: updatedTreesState,
            };
        }),
    treesState: [],
    fireInfluenceRadius: 0.5, // the radius in which fire would burn a tree
}));

export default useStateStore;

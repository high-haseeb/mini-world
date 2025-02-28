import { create } from 'zustand'

export const Options = {
    NONE: "none",
    TREE: "tree",
    FIRE: "fire",
    RAIN: "rain",
};

const useStateStore = create((set) => ({
    activeOption: Options.NONE,
    setOption: (option) => set({ activeOption: option }),
    autoRotate : true,
    stopAutoRotate:  () => set({ autoRotate: false }),
    startAutoRotate: () => set({ autoRotate: true }),

    fires: 100,
    rains: 100,
    trees: 100,
    decrementFire: () => set((state) => ({ fires: state.fires - 1 })),
    decrementRain: () => set((state) => ({ rains: state.rains - 1 })),
    decrementTree: () => set((state) => ({ trees: state.trees - 1 })),
}));

export const useWarnStore = create((set) => ({
    warn: false,
    warnTimeout: 3000,
    setWarn:    () => set({ warn: true }),
    removeWarn: () => set({ warn: false }),
}));

export const useTreesStore = create((set) => ({
    numTrees: 0,
    addTree: (position, rotation, burned) =>
        set((state) => ({
            numTrees: state.numTrees + 1,
            treesState: [...state.treesState, { position, rotation, burned }],
        })),
    removeTree: (index) =>
        set((state) => {
            const updatedTreesState = [...state.treesState];
            updatedTreesState[index].burned = true;
            // updatedTreesState.splice(index, 1);
            return {
                numTrees: state.numTrees - 1,
                treesState: updatedTreesState,
            };
        }),
    highlighted: false,
    setHighlight: (highlighted) => set(() => ({ highlighted: highlighted })),
    highlightedPosition: [0, 0, 0],
    setHighlightPosition: (highlightedPosition) => set(() => ({ highlightedPosition: highlightedPosition  })),
    highlightIndex : 0, 
    setHighlightIndex: (highlightIndex) => set(() => ({ highlightIndex: highlightIndex  })),

    treesState: [],
    fireInfluenceRadius: 0.1, // the radius in which fire would burn a tree
}));

export default useStateStore;

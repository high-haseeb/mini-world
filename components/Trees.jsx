import Tree from './Tree'
import { useTreesStore } from '@/stores/stateStore'

const Trees = () => {
    const { treesState } = useTreesStore();

    return (
        <group>
            {
                treesState.map((state, idx) => (
                    <Tree {...state} index={idx} key={idx} />
                ))
            }
        </group>
    )
}

export default Trees;

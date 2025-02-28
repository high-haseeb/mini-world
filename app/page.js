"use client";
import Experience from "@/components/Experience";
import useStateStore, { Options, useTreesStore } from "@/stores/stateStore";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Home() {
    return (
        <div className="w-screen h-screen overflow-hidden bg-[#181818] text-white">
            <Overlay />
            <Experience />
            <OptionsSelector />
            <Stats />
            <MouseImage />
        </div >
    );
}

const Stats = () => {
    const { fires, rains } = useStateStore();
    const { numTrees } = useTreesStore();

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col select-none">
            <div className="flex items-center justify-center gap-2">
                <span className="text-base lg:text-2xl font-semibold capitalize">fires</span>
                <span className="text-base lg:text-2xl font-semibold capitalize">{fires}/100</span>
                <div className="w-64 h-2 rounded-full bg-yellow-400 relative hidden lg:block">
                    <div className="absolute top-0 left-0 h-2 rounded-full bg-red-700" style={{ width: `${(fires / 100 * 16)}rem` }}></div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2">
                <span className="text-base lg:text-2xl font-semibold capitalize">rains</span>
                <span className="text-base lg:text-2xl font-semibold capitalize">{rains}/100</span>
                <div className="w-64 h-2 rounded-full bg-blue-400 relative hidden lg:block">
                    <div className="absolute top-0 left-0 h-2 rounded-full bg-blue-800" style={{ width: `${(rains / 100 * 16)}rem` }}></div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2">
                <span className="text-base lg:text-2xl font-semibold capitalize">trees</span>
                <span className="text-base lg:text-2xl font-semibold capitalize">{numTrees}/100</span>
                <div className="w-64 h-2 rounded-full bg-green-400 relative hidden lg:block">
                    <div className="absolute top-0 left-0 h-2 rounded-full bg-green-800" style={{ width: `${(numTrees / 100 * 16)}rem` }}></div>
                </div>
            </div>
        </div>
    )
}

const OptionsSelector = () => {
    const { activeOption, setOption } = useStateStore();

    const OptionButton = ({ element, option }) => (
        <button
            className={`p-4 rounded-full bg-white/10 transition-colors ${activeOption === option ? "bg-white/50" : "hover:bg-white/20"}`}
            title={`add ${element}`}
            onClick={() => activeOption == option ? setOption(Options.NONE) : setOption(option)}
        >
            <Image src={`/icons/${element}.svg`} width={36} height={36} alt={element} className={`${activeOption === option ? "invert" : ""}`} />
        </button>
    )

    return (
        <div className="absolute top-1/2 -translate-y-1/2 right-10 flex flex-col gap-4 select-none">
            <OptionButton element="fire" option={Options.FIRE} />
            <OptionButton element="rain" option={Options.RAIN} />
        </div>
    )
};

const MouseImage = () => {
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
    const { activeOption } = useStateStore();

    useEffect(() => {
        const handleMouseMove = (event) => { setPointer({ x: event.clientX, y: event.clientY }); };
        window.addEventListener("mousemove", handleMouseMove);
        return () => { window.removeEventListener("mousemove", handleMouseMove); };
    }, []);

    return (
        <>{
            activeOption === Options.FIRE ?
                <Image src={`/icons/fire.svg`} width={36} height={36} alt="mouse follower" className={`fixed pointer-events-none`}
                    style={{
                        top: pointer.y,
                        left: pointer.x,
                        position: "absolute",
                    }}
                />
                : activeOption == Options.RAIN ?
                    <Image src={`/icons/rain.svg`} width={36} height={36} alt="mouse follower" className={`fixed pointer-events-none`}
                        style={{
                            top: pointer.y,
                            left: pointer.x,
                            position: "absolute",
                        }}
                    />
                    :
                    <></>
        }</>
    );
};

const Overlay = () => {
    const [commitMessage, setCommitMessage] = useState('');
    const [commitTime, setCommitTime] = useState('');

    useEffect(() => {
        const fetchCommitMessage = async () => {
            const owner = 'high-haseeb';
            const repo = 'mini-world';
            const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.length > 0) {
                    setCommitMessage(data[0].commit.message);

                    // Get commit time and format it
                    const commitDate = new Date(data[0].commit.author.date);
                    setCommitTime(commitDate.toLocaleString());
                }
            } catch (error) {
                console.error('Error fetching commit data:', error);
                setCommitMessage('Error fetching commit message');
            }
        };

        fetchCommitMessage();
    }, []);

    return (
        <>
            <div className="absolute top-6 left-6 flex flex-col select-none">
                <span className="font-semibold text-5xl">Mini World</span>
                <span className="font-extralight"> version: 0.0.3</span>
                {commitMessage && (
                    <span className="font-light text-sm mt-2">Last Update: {commitMessage}</span>
                )}
                {commitTime && (
                    <span className="font-light text-sm mt-1">Committed on: {commitTime}</span>
                )}
            </div>
            <Link href="https://github.com/high-haseeb/mini-world" className="absolute bottom-6 left-6">
                <Image src={'/icons/github-mark.svg'} width={16} height={16} alt="github-link" />
            </Link>
        </>
    );
};


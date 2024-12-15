"use client";
import Experience from "@/components/Experience";
import useStateStore, { Options } from "@/stores/stateStore";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
    return (
        <div className="w-screen h-screen overflow-hidden bg-[#181818] text-white">
            <Overlay />
            <Experience />
            <OptionsSelector />
            <Stats />
        </div >
    );
}

const Stats = () => {
    const { fires, rains } = useStateStore();

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col">
            <div className="flex items-center justify-center gap-2">
                <span className="text-base lg:text-2xl font-semibold capitalize">fires</span>
                <span className="text-base lg:text-2xl font-semibold capitalize">{fires}/100</span>
                <div className="w-64 h-2 rounded-full bg-yellow-400 relative hidden lg:block">
                    <div className="absolute top-0 left-0 h-2 rounded-full bg-orange-400" style={{ width: `${(fires / 100 * 16)}rem` }}></div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2">
                <span className="text-base lg:text-2xl font-semibold capitalize">rains</span>
                <span className="text-base lg:text-2xl font-semibold capitalize">{rains}/100</span>
                <div className="w-64 h-2 rounded-full bg-yellow-400 relative hidden lg:block">
                    <div className="absolute top-0 left-0 h-2 rounded-full bg-orange-400" style={{ width: `${(rains / 100 * 16)}rem` }}></div>
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
        <div className="absolute top-1/2 -translate-y-1/2 right-10 flex flex-col gap-4">
            <OptionButton element="fire" option={Options.FIRE} />
            <OptionButton element="rain" option={Options.RAIN} />
        </div>
    )
}


const Overlay = () => (
    <>
        <div className="absolute top-6 left-6 flex flex-col select-none">
            <span className="font-semibold text-5xl">Mini World</span>
            <span className="font-extralight"> version: 0.0.2</span>
        </div>
        <Link href="https://github.com/high-haseeb/mini-world" className="absolute bottom-6 left-6">
            <Image src={'/icons/github-mark.svg'} width={16} height={16} alt="github-lin" />
        </Link>
    </>
)

import { Dot } from "lucide-react";
import HandTrackingSVG from "./handtracking-svg";

export default function HandTrackingBox(){
    return (
        <div className=" w-full h-full px-16 py-16">
            <div className="bg-[#13165C] w-full h-auto flex flex-col rounded-3xl backdrop-blur-lg">
                {/**header of the box */}
                <div className="flex items-center justify-between px-8 py-6 text-xl ">
                    <div className="flex items-center">
                        <Dot size={30} color="#00FF39"/>
                        <span>Tracking</span>
                    </div>

                    <div>
                        <span>[20]</span>
                        <span className="text-[#00FF39]">fps</span>
                    </div>
                </div>

                {/**content of the box */}
                <div className="px-6 pb-6 mt-auto flex justify-center">
                    <HandTrackingSVG className="w-[500px] h-[500px]"/>

                </div>

                {/**footer of the box */}
                <div className="px-6 pb-6 mt-auto">
                    <div className="w-full h-15 bg-[#4F5DFF] rounded-xl flex items-center px-6 text-lg">
                        <h1>{'>'} {'"hello"'} <span className="text-[#00FF39]">[accuracy XX%]</span></h1>

                    </div>
                </div>

            </div>

        </div>
    )
}
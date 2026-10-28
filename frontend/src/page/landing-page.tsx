import HandTrackingBox from "@/components/hand-tracking-box";
import LandingLayout from "@/components/layout/landing-layout";

export default function landingPage() {
    return (
        <LandingLayout>
            <section className="px-4 ">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black">
                        01
                    </div>

                    <div className="">
                        <HandTrackingBox/>
                    </div>

                </div>
            </section>

        </LandingLayout>
    )
}
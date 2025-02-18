import { PropsWithChildren } from "react";
import loginBg from "../Assets/login_bg.jpg";
import logo from "../Assets/logo.png";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-green-400 p-4">
            <div className="grid grid-flow-col grid-cols-2 bg-yellow-200 p-4 min-w-full ">
                <div className="bg-white w-full">{children}</div>
                <div className="bg-green-900 w-full">
                    <div className="object-cover">
                        <div className="flex justify-center content-center w-full"></div>
                        <img
                            src={loginBg}
                            alt="log in bg"
                            width=""
                            height=""
                            className="rounded-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

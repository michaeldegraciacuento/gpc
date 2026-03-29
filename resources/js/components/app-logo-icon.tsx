import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/image/gpc.png"
            alt="GPC Logo"
            className={`object-cover ${props.className || ''}`}
        />
    );
}

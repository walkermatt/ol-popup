import Overlay from "ol/Overlay";
import Popup from "./ol-popup";

declare global {
    interface Window {
        ol: {
            Overlay: Overlay & {Popup: typeof Popup}
        };
    }
}
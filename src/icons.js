import {
    Target, RotateCw, Timer, Music, Dumbbell, Waves as WavesIcon, Activity,
    Brain, Zap, Combine, ArrowUp, ArrowRight, ArrowDown, RollerCoaster,
    Bot, Droplet, Footprints, Repeat, Route as RouteIcon, TrendingUp, Circle
} from 'lucide-react';

// Icons a drill may reference by name. A drill whose `icon` is not a key here
// still renders its text, just without the icon.
//
// `Route` is aliased because it collides with React Router's Route, and
// `Waves` because a prompt is also called Waves.
export const iconMap = {
    Target, RotateCw, Timer, Music, Dumbbell, WavesIcon, Activity,
    Brain, Zap, Combine, ArrowUp, ArrowRight, ArrowDown, RollerCoaster,
    Bot, Droplet, Footprints, Repeat, RouteIcon, TrendingUp, Circle
};

// Derived rather than hand-listed: the submit form's icon dropdown used to
// repeat these names, so adding an icon meant editing two lists.
export const availableIcons = Object.keys(iconMap);

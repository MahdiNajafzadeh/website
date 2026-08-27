import * as migration_20260814_103431 from "./20260814_103431";

export const migrations = [
    {
        up: migration_20260814_103431.up,
        down: migration_20260814_103431.down,
        name: "20260814_103431",
    },
];

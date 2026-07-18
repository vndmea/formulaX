# Layer FormulaX editor warmup

FormulaX editor startup now treats the Formula Surface and Runtime Toolbar as separate warmup consumers over the same runtime font and layout dependencies. We use shared font/runtime warmup, prioritized Toolbar Preview rendering, and instance-local popover reuse instead of rendering every toolbar preview eagerly, because full eager rendering competes with the first Formula Surface paint while no warmup leaves the first toolbar interaction visibly busy.


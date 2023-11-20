import esbuild from 'esbuild';

esbuild
	.build({
		entryPoints: ['src/index.ts'],
		outdir: 'dist',
		bundle: true,
		minify: true,
		platform: 'node',
		resolveExtensions: ['.ts'],
		packages: 'external',
		format: 'esm',
		watch: true,
	})
	.catch(() => process.exit(1));

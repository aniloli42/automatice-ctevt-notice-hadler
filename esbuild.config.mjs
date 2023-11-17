import esbuild from 'esbuild';

esbuild
	.build({
		entryPoints: [
			'src/index.ts',
			'src/services/worker.ts',
			'src/notices/notice.worker.ts',
		],
		outdir: 'dist',
		bundle: true,
		minify: true,
		platform: 'node',
		resolveExtensions: ['.ts'],
		packages: 'external',
		format: 'esm',
	})
	.catch(() => process.exit(1));

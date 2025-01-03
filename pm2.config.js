module.exports = {
	apps: [
		{
			name: 'dashboard-backend',
			script: 'src/index.ts',
			interpreter: 'bun',
			env: {
				PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`
			}
		},
		{
			name: 'dashboard',
			script: 'start-web.sh'
		},
	]
};
module.exports = {
	apps: [
		{
			name: 'call-dashboard-backend',
			script: 'src/index.ts',
			interpreter: 'bun',
			env: {
				PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`
			}
		},
		{
			name: 'call-dashboard',
			script: 'start-web.sh'
		},
	]
};
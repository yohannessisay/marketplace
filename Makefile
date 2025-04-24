run:
	@echo "Running frontend..."
	@pnpm run start
pgen:
	@echo "generating Prisma..."
	@pnpx  prisma generate
ppush:
	@echo "Pushing Prisma..."
	@pnpx  prisma db push
dev:
	@echo "Running frontend in development mode..."
	@pnpm run dev

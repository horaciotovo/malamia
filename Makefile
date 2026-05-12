.PHONY: help up down logs build seed migrate reset-db admin-list admin-promote admin-reset-password clean

# Color output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(CYAN)🌸 Malamia Project Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ─────────────────────────────────────
# Docker Services
# ─────────────────────────────────────

up: ## Start all services
	@echo "$(CYAN)📦 Starting services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Services started$(NC)"
	@echo "   Backoffice: http://localhost:5173"
	@echo "   Backend API: http://localhost:3001"

down: ## Stop all services
	@echo "$(CYAN)🛑 Stopping services...$(NC)"
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-postgres: ## Show database logs
	docker-compose logs -f postgres

logs-backoffice: ## Show backoffice logs
	docker-compose logs -f backoffice

build: ## Rebuild all containers
	@echo "$(CYAN)🔨 Building containers...$(NC)"
	docker-compose up --build -d

ps: ## Show running containers
	docker-compose ps

# ─────────────────────────────────────
# Database Commands
# ─────────────────────────────────────

migrate: ## Run database migrations
	@echo "$(CYAN)🔄 Running migrations...$(NC)"
	docker-compose exec backend npm run db:migrate

seed: ## Seed database with sample data
	@echo "$(CYAN)🌱 Seeding database...$(NC)"
	docker-compose exec backend npm run db:seed

studio: ## Open Prisma Studio (database editor)
	@echo "$(CYAN)📊 Opening Prisma Studio...$(NC)"
	docker-compose exec backend npm run db:studio

reset-db: ## Reset database (WARNING: deletes all data)
	@echo "$(RED)⚠️  Resetting database - all data will be deleted!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] && \
	docker-compose down -v && \
	docker-compose up -d && \
	sleep 10 && \
	docker-compose exec backend npm run db:migrate && \
	docker-compose exec backend npm run db:seed || echo "Cancelled"

# ─────────────────────────────────────
# Admin User Management
# ─────────────────────────────────────

admin-list: ## List all admin users
	docker-compose exec backend node scripts/list-admins.js

admin-promote: ## Promote user to admin (usage: make admin-promote EMAIL=user@example.com)
	@if [ -z "$(EMAIL)" ]; then \
		echo "$(RED)Error: EMAIL not specified$(NC)"; \
		echo "Usage: make admin-promote EMAIL=user@example.com"; \
	else \
		docker-compose exec backend node scripts/promote-admin.js $(EMAIL); \
	fi

admin-reset-password: ## Reset admin password (usage: make admin-reset-password EMAIL=user@example.com PASSWORD=newpass)
	@if [ -z "$(EMAIL)" ] || [ -z "$(PASSWORD)" ]; then \
		echo "$(RED)Error: EMAIL and PASSWORD required$(NC)"; \
		echo "Usage: make admin-reset-password EMAIL=user@example.com PASSWORD=newpass"; \
	else \
		docker-compose exec backend node scripts/reset-password.js $(EMAIL) $(PASSWORD); \
	fi

# ─────────────────────────────────────
# Development
# ─────────────────────────────────────

backend-shell: ## Open shell in backend container
	docker-compose exec backend sh

db-shell: ## Open psql shell in database
	docker-compose exec postgres psql -U malamia -d malamia_db

clean: ## Remove all containers and volumes (WARNING: deletes data)
	@echo "$(RED)⚠️  Removing all containers and volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✅ Cleaned$(NC)"

install: ## Install dependencies
	cd backend && npm install
	cd ../backoffice && npm install
	cd ../mobile && npm install

# ─────────────────────────────────────
# Info
# ─────────────────────────────────────

info: ## Show service info
	@echo "$(CYAN)🌸 Malamia Services$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(CYAN)📊 Backoffice:$(NC) http://localhost:5173"
	@echo "$(CYAN)🔌 Backend API:$(NC) http://localhost:3001"
	@echo "$(CYAN)🗄️  Database:$(NC) localhost:5432"
	@echo ""
	@echo "$(CYAN)👤 Default Admin:$(NC)"
	@echo "   Email: htovoadmin@gmail.com"
	@echo "   Password: admin123456"

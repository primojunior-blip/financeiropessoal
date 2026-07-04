-- Limpa orçamentos existentes (eram por mês/ano, agora serão globais)
DELETE FROM "Budget";

-- Remove o índice único antigo ANTES de dropar as colunas
DROP INDEX IF EXISTS "Budget_categoryId_month_year_key";

-- Remove colunas month e year
ALTER TABLE "Budget" DROP COLUMN "month";
ALTER TABLE "Budget" DROP COLUMN "year";

-- Cria novo índice único só em categoryId
CREATE UNIQUE INDEX "Budget_categoryId_key" ON "Budget"("categoryId");

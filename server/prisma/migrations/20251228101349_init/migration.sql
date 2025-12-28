-- CreateTable
CREATE TABLE "flashcards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "codeSnippet" TEXT,
    "codeLanguage" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "flashcards_subject_idx" ON "flashcards"("subject");

-- CreateIndex
CREATE INDEX "flashcards_category_idx" ON "flashcards"("category");

-- CreateIndex
CREATE INDEX "flashcards_difficulty_idx" ON "flashcards"("difficulty");

-- CreateIndex
CREATE INDEX "flashcards_createdAt_idx" ON "flashcards"("createdAt");

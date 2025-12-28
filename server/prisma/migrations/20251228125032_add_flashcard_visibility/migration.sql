-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flashcards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "codeSnippet" TEXT,
    "codeLanguage" TEXT,
    "tags" TEXT,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "flashcards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flashcards" ("back", "category", "codeLanguage", "codeSnippet", "createdAt", "difficulty", "front", "id", "imageUrl", "subject", "tags", "updatedAt", "userId") SELECT "back", "category", "codeLanguage", "codeSnippet", "createdAt", "difficulty", "front", "id", "imageUrl", "subject", "tags", "updatedAt", "userId" FROM "flashcards";
DROP TABLE "flashcards";
ALTER TABLE "new_flashcards" RENAME TO "flashcards";
CREATE INDEX "flashcards_subject_idx" ON "flashcards"("subject");
CREATE INDEX "flashcards_category_idx" ON "flashcards"("category");
CREATE INDEX "flashcards_difficulty_idx" ON "flashcards"("difficulty");
CREATE INDEX "flashcards_createdAt_idx" ON "flashcards"("createdAt");
CREATE INDEX "flashcards_userId_idx" ON "flashcards"("userId");
CREATE INDEX "flashcards_isPublic_idx" ON "flashcards"("isPublic");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "flashcard_likes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "flashcardId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "flashcard_likes_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "flashcard_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "flashcard_likes_userId_idx" ON "flashcard_likes"("userId");

-- CreateIndex
CREATE INDEX "flashcard_likes_flashcardId_idx" ON "flashcard_likes"("flashcardId");

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_likes_flashcardId_userId_key" ON "flashcard_likes"("flashcardId", "userId");

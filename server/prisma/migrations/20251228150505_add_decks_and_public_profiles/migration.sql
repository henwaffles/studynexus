-- CreateTable
CREATE TABLE "decks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "decks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deck_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deckId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deck_members_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deck_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deck_flashcards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deckId" INTEGER NOT NULL,
    "flashcardId" INTEGER NOT NULL,
    "addedById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deck_flashcards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deck_flashcards_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deck_flashcards_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "decks_ownerId_idx" ON "decks"("ownerId");

-- CreateIndex
CREATE INDEX "decks_createdAt_idx" ON "decks"("createdAt");

-- CreateIndex
CREATE INDEX "deck_members_userId_idx" ON "deck_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "deck_members_deckId_userId_key" ON "deck_members"("deckId", "userId");

-- CreateIndex
CREATE INDEX "deck_flashcards_flashcardId_idx" ON "deck_flashcards"("flashcardId");

-- CreateIndex
CREATE INDEX "deck_flashcards_addedById_idx" ON "deck_flashcards"("addedById");

-- CreateIndex
CREATE UNIQUE INDEX "deck_flashcards_deckId_flashcardId_key" ON "deck_flashcards"("deckId", "flashcardId");

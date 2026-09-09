-- DropForeignKey
ALTER TABLE "FolderShare" DROP CONSTRAINT "FolderShare_folderId_fkey";

-- AddForeignKey
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

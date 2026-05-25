-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'in_progress', 'closed', 'archived', 'cancelled');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('none', 'low', 'medium', 'high');

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "Priority" NOT NULL DEFAULT 'none',
    "creatorId" INTEGER NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketAssignment" (
    "ticketId" INTEGER NOT NULL,
    "specialistId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAssignment_pkey" PRIMARY KEY ("ticketId","specialistId")
);

-- CreateTable
CREATE TABLE "TicketResponse" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketHistory" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "actorId" INTEGER,
    "oldStatus" "TicketStatus",
    "newStatus" "TicketStatus" NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_ticketId_userId_key" ON "Feedback"("ticketId", "userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAssignment" ADD CONSTRAINT "TicketAssignment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAssignment" ADD CONSTRAINT "TicketAssignment_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResponse" ADD CONSTRAINT "TicketResponse_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResponse" ADD CONSTRAINT "TicketResponse_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE VIEW admin_users_overview AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    u.phone,
    r.name AS role_name,
    u."createdAt" AS created_at,
    COUNT(DISTINCT t.id) AS created_ticket_count,
    COUNT(DISTINCT ta."ticketId") AS assigned_ticket_count,
    COUNT(DISTINCT tr.id) AS response_count
FROM "User" u
JOIN "Role" r
    ON r.id = u."roleId"
LEFT JOIN "Ticket" t
    ON t."creatorId" = u.id
LEFT JOIN "TicketAssignment" ta
    ON ta."specialistId" = u.id
LEFT JOIN "TicketResponse" tr
    ON tr."authorId" = u.id
GROUP BY
    u.id,
    u.name,
    u.email,
    u.phone,
    r.name,
    u."createdAt";

CREATE VIEW admin_tickets_overview AS
SELECT
    t.id AS ticket_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."isArchived",
    t."createdAt" AS created_at,
    t."updatedAt" AS updated_at,
    creator.id AS creator_id,
    creator.name AS creator_name,
    creator.email AS creator_email,
    COUNT(DISTINCT a."specialistId") AS assigned_specialist_count,
    COUNT(DISTINCT r.id) AS response_count
FROM "Ticket" t
JOIN "User" creator
    ON creator.id = t."creatorId"
LEFT JOIN "TicketAssignment" a
    ON a."ticketId" = t.id
LEFT JOIN "TicketResponse" r
    ON r."ticketId" = t.id
GROUP BY
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."isArchived",
    t."createdAt",
    t."updatedAt",
    creator.id,
    creator.name,
    creator.email;

CREATE VIEW specialist_assigned_tickets AS
SELECT
    t.id AS ticket_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."isArchived",
    t."createdAt" AS created_at,
    t."updatedAt" AS updated_at,
    creator.id AS creator_id,
    creator.name AS creator_name,
    creator.email AS creator_email,
    a."assignedAt" AS assigned_at
FROM "Ticket" t
JOIN "TicketAssignment" a
    ON a."ticketId" = t.id
JOIN "User" specialist
    ON specialist.id = a."specialistId"
JOIN "User" creator
    ON creator.id = t."creatorId"
WHERE specialist.id = current_setting('app.current_user_id', true)::int
  AND t."isArchived" = false;

CREATE VIEW specialist_ticket_details_with_response_count AS
SELECT
    t.id AS ticket_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."isArchived",
    t."createdAt" AS created_at,
    t."updatedAt" AS updated_at,
    creator.id AS creator_id,
    creator.name AS creator_name,
    creator.email AS creator_email,
    COUNT(DISTINCT r.id) AS response_count,
    MAX(r."createdAt") AS last_response_at
FROM "Ticket" t
JOIN "TicketAssignment" a
    ON a."ticketId" = t.id
JOIN "User" specialist
    ON specialist.id = a."specialistId"
JOIN "User" creator
    ON creator.id = t."creatorId"
LEFT JOIN "TicketResponse" r
    ON r."ticketId" = t.id
WHERE specialist.id = current_setting('app.current_user_id', true)::int
GROUP BY
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."isArchived",
    t."createdAt",
    t."updatedAt",
    creator.id,
    creator.name,
    creator.email;

CREATE VIEW user_created_tickets AS
SELECT
    t.id AS ticket_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."isArchived",
    t."createdAt" AS created_at,
    t."updatedAt" AS updated_at,
    COUNT(DISTINCT r.id) AS response_count,
    COUNT(DISTINCT f.id) AS feedback_count
FROM "Ticket" t
JOIN "User" creator
    ON creator.id = t."creatorId"
LEFT JOIN "TicketResponse" r
    ON r."ticketId" = t.id
LEFT JOIN "Feedback" f
    ON f."ticketId" = t.id
WHERE creator.id = current_setting('app.current_user_id', true)::int
GROUP BY
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."isArchived",
    t."createdAt",
    t."updatedAt";

CREATE VIEW user_ticket_responses_with_authors AS
SELECT
    r.id AS response_id,
    r."ticketId" AS ticket_id,
    t.title AS ticket_title,
    r.content,
    r."createdAt" AS response_created_at,
    author.id AS author_id,
    author.name AS author_name,
    author.email AS author_email
FROM "TicketResponse" r
JOIN "Ticket" t
    ON t.id = r."ticketId"
JOIN "User" creator
    ON creator.id = t."creatorId"
JOIN "User" author
    ON author.id = r."authorId"
WHERE creator.id = current_setting('app.current_user_id', true)::int
  AND t."isArchived" = false;

CREATE OR REPLACE FUNCTION ticket_status_archive_audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
    actor_id INTEGER;
    final_status "TicketStatus";
BEGIN
    actor_id := current_setting('app.current_user_id', true)::int;
    final_status := NEW.status;

    IF final_status = 'closed'
       AND NEW."isArchived" = false
       AND NEW."closedAt" IS NOT NULL
       AND NEW."closedAt" <= NOW() - INTERVAL '7 days' THEN
        final_status := 'archived';
        NEW.status := 'archived';
        NEW."isArchived" := true;
    END IF;

    IF final_status IS DISTINCT FROM OLD.status THEN
        INSERT INTO "TicketHistory" ("ticketId", "actorId", "oldStatus", "newStatus", "changeDate")
        VALUES (NEW.id, actor_id, OLD.status, final_status, NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_status_archive_audit
BEFORE UPDATE ON "Ticket"
FOR EACH ROW
EXECUTE FUNCTION ticket_status_archive_audit_trigger_fn();

CREATE OR REPLACE FUNCTION ticket_response_audit_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
    actor_id INTEGER;
    ticket_status "TicketStatus";
BEGIN
    actor_id := current_setting('app.current_user_id', true)::int;

    SELECT t.status
    INTO ticket_status
    FROM "Ticket" t
    WHERE t.id = NEW."ticketId";

    INSERT INTO "TicketHistory" ("ticketId", "actorId", "oldStatus", "newStatus", "changeDate")
    VALUES (NEW."ticketId", actor_id, ticket_status, ticket_status, NOW());

    IF ticket_status = 'closed' THEN
        UPDATE "Ticket"
        SET "closedAt" = NOW()
        WHERE id = NEW."ticketId";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_response_audit
AFTER INSERT ON "TicketResponse"
FOR EACH ROW
EXECUTE FUNCTION ticket_response_audit_trigger_fn();
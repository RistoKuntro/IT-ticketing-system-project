/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Piletite haldamine
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Piletite nimekiri
 *     description: Admin näeb kõiki piletteid, tavakasutaja ainult enda omi. Toetab filtreerimist ja otsingut.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, closed, cancelled]
 *         description: Filtreeri staatuse järgi
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filtreeri prioriteedi järgi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Otsi pealkirja ja kirjelduse järgi
 *     responses:
 *       200:
 *         description: Piletite nimekiri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 total:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Autentimine nõutud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Loo uus pilet
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: Arvuti ei käivitu
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: Hommikust saati ei tule tööle, ekraan jääb mustaks.
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Pilet loodud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       422:
 *         description: Valideerimise viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Ühe pileti detail
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pileti ID
 *     responses:
 *       200:
 *         description: Pileti andmed koos lahenduste ja kasutajatega
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Puuduvad õigused
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pilet ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Uuenda piletit
 *     description: |
 *       Kasutaja saab muuta ainult oma avatud pileti pealkirja, kirjeldust ja prioriteeti.
 *       Admin saab muuta kõiki välju sh staatust ja töötajat.
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, closed, cancelled]
 *                 description: Ainult admin saab muuta (v.a kasutaja saab oma pileti tühistada)
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *                 description: Ainult admin saab määrata
 *     responses:
 *       200:
 *         description: Pilet uuendatud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Puuduvad õigused
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pilet ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Kustuta pilet (ainult admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pilet kustutatud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pilet kustutatud
 *       403:
 *         description: Puuduvad õigused — ainult admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pilet ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tickets/{id}/solutions:
 *   post:
 *     summary: Lisa lahendus piletile (ainult admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pileti ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: Lahendasin probleemi toitekaablit vahetades.
 *     responses:
 *       201:
 *         description: Lahendus lisatud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 solution:
 *                   $ref: '#/components/schemas/Solution'
 *       403:
 *         description: Puuduvad õigused — ainult admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pilet ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tickets/{id}/solutions/{solutionId}:
 *   delete:
 *     summary: Kustuta lahendus (ainult admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pileti ID
 *       - in: path
 *         name: solutionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lahenduse ID
 *     responses:
 *       200:
 *         description: Lahendus kustutatud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lahendus kustutatud
 *       403:
 *         description: Puuduvad õigused
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lahendust ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kasutajate haldus (ainult admin)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Kõik kasutajad (ainult admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kasutajate nimekiri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Puuduvad õigused
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Muuda kasutaja rolli (ainult admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kasutaja ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Roll uuendatud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Puuduvad õigused
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Kasutajat ei leitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export default {};
local ESX = exports["es_extended"]:getSharedObject()

--================================================
-- EMAIL GENERATION
--================================================
local function GetPlayerEmail(xPlayer)
    local name = xPlayer.getName():lower()

    name = name:gsub("%s+", ".")
    name = name:gsub("%.%.+", ".")
    name = name:gsub("^%.", "")
    name = name:gsub("%.$", "")

    return name .. "@ezemail.com"
end

--================================================
-- REQUEST EMAIL
--================================================
RegisterNetEvent("ez_email:requestEmail", function()

    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)

    if not xPlayer then
        TriggerClientEvent("ez_email:returnEmail", src, {
            email = "unknown@ezemail.com"
        })
        return
    end

    TriggerClientEvent("ez_email:returnEmail", src, {
        email = GetPlayerEmail(xPlayer)
    })
end)

--================================================
-- GET EMAILS (INBOX / SENT / TRASH)
--================================================
lib.callback.register("ez_email:getInbox", function(source, data)

    local email = data and data.email
    local folder = data and data.folder or "inbox"

    if not email then return {} end

    local query
    local params = { email }

    if folder == "inbox" then

        query = [[
            SELECT *
            FROM ez_emails
            WHERE receiver = ?
            AND (deleted = 0 OR deleted IS NULL)
            ORDER BY created_at DESC
        ]]

    elseif folder == "sent" then

        query = [[
            SELECT *
            FROM ez_emails
            WHERE sender = ?
            AND deleted = 0
            ORDER BY created_at DESC
        ]]

    elseif folder == "trash" then

        query = [[
            SELECT *
            FROM ez_emails
            WHERE receiver = ?
            AND deleted = 1
            ORDER BY created_at DESC
        ]]

    else
        query = [[
            SELECT *
            FROM ez_emails
            WHERE receiver = ?
            AND (deleted = 0 OR deleted IS NULL)
            ORDER BY created_at DESC
        ]]
    end

    return MySQL.query.await(query, params) or {}
end)

--================================================
-- MARK READ
--================================================
RegisterNetEvent("ez_email:markRead", function(id)

    id = tonumber(id)
    if not id then return end

    MySQL.update.await([[
        UPDATE ez_emails
        SET is_read = 1
        WHERE id = ?
    ]], { id })

end)

--================================================
-- DELETE EMAIL (MOVE TO TRASH)
--================================================
RegisterNetEvent("ez_email:markDeleted", function(id)

    id = tonumber(id)
    if not id then return end

    MySQL.update.await([[
        UPDATE ez_emails
        SET deleted = 1
        WHERE id = ?
    ]], { id })

end)

--================================================
-- RESTORE EMAIL
--================================================
RegisterNetEvent("ez_email:restoreEmail", function(id)

    id = tonumber(id)
    if not id then return end

    MySQL.update.await([[
        UPDATE ez_emails
        SET deleted = 0
        WHERE id = ?
    ]], { id })

end)

--================================================
-- EMPTY TRASH
--================================================
RegisterNetEvent("ez_email:emptyTrash", function(email)

    MySQL.query.await([[
        DELETE FROM ez_emails
        WHERE receiver = ?
        AND deleted = 1
    ]], { email })

end)

--================================================
-- SEND EMAIL
--================================================
RegisterNetEvent("ez_email:sendReply", function(data)

    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then return end

    local senderEmail = GetPlayerEmail(xPlayer)

    MySQL.insert.await([[
        INSERT INTO ez_emails
        (thread_id, sender, receiver, subject, body, is_read, deleted, created_at)
        VALUES (?, ?, ?, ?, ?, 0, 0, ?)
    ]], {
        data.thread_id,
        senderEmail,
        data.receiver,
        data.subject,
        data.body,
        os.time()
    })
end)

--================================================
-- AUTO CLEANUP (7 DAYS)
--================================================
CreateThread(function()

    while true do

        Wait(60 * 60 * 1000)

        local cutoff = os.time() - (7 * 24 * 60 * 60)

        MySQL.query.await([[
            DELETE FROM ez_emails
            WHERE deleted = 1
            AND created_at < ?
        ]], { cutoff })

        print("[EMAIL CLEANUP] old trash removed")

    end
end)
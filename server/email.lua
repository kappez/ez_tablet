
local ESX = exports["es_extended"]:getSharedObject()

--====================================
-- GENERATE EMAIL
--====================================
local function GetPlayerEmail(xPlayer)

    local name = xPlayer.getName():lower()

    name = name:gsub("%s+", ".")
    name = name:gsub("%.%.+", ".")
    name = name:gsub("^%.", "")
    name = name:gsub("%.$", "")

    return name .. "@ezemail.com"
end

--====================================
-- REQUEST EMAIL
--====================================
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

--====================================
-- GET INBOX (FIXED: DELETE SUPPORT)
--====================================
lib.callback.register("ez_email:getInbox", function(source, email)

    print("[EMAIL DEBUG] inbox request:", email)

    local result = MySQL.query.await([[
        SELECT *
        FROM ez_emails
        WHERE receiver = ?
        AND (deleted IS NULL OR deleted = 0)
        ORDER BY created_at DESC
    ]], { email })

    print("[EMAIL DEBUG] inbox rows:", result and #result or 0)

    return result or {}
end)

--====================================
-- MARK AS READ
--====================================
RegisterNetEvent("ez_email:markRead", function(id)

    MySQL.update([[
        UPDATE ez_emails
        SET is_read = 1
        WHERE id = ?
    ]], { id })

end)

--====================================
-- DELETE EMAIL (PERMANENT FIX LOGIC)
--====================================
RegisterNetEvent("ez_email:markDeleted", function(id)

    MySQL.update([[
        UPDATE ez_emails
        SET deleted = 1
        WHERE id = ?
    ]], { id })

    print("[EMAIL DEBUG] deleted email id:", id)

end)

--====================================
-- SEND EMAIL / REPLY
--====================================
RegisterNetEvent("ez_email:sendReply", function(data)

    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then return end

    local senderEmail = GetPlayerEmail(xPlayer)

    MySQL.insert([[
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
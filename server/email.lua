local ESX = exports["es_extended"]:getSharedObject()

--====================================
-- GENERATE PLAYER EMAIL
--====================================
local function GetPlayerEmail(xPlayer)

    local name = xPlayer.getName():lower()

    -- Replace spaces with dots
    name = name:gsub("%s+", ".")

    -- Remove weird duplicate dots
    name = name:gsub("%.%.+", ".")

    -- Trim dots from start/end
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

    local email = GetPlayerEmail(xPlayer)

    TriggerClientEvent("ez_email:returnEmail", src, {
        email = email
    })
end)

--====================================
-- GET INBOX
--====================================
lib.callback.register("ez_email:getInbox", function(source, email)

    print("[EMAIL DEBUG] callback email = [" .. tostring(email) .. "]")

    local result = MySQL.query.await([[
        SELECT *
        FROM ez_emails
        WHERE receiver = ?
        ORDER BY created_at DESC
    ]], { email })

    print("[EMAIL DEBUG] rows found:", result and #result or 0)

    return result or {}
end)

--====================================
-- MARK READ
--====================================
RegisterNetEvent("ez_email:markRead", function(id)
    MySQL.update("UPDATE ez_emails SET is_read = 1 WHERE id = ?", { id })
end)

--====================================
-- SEND REPLY
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
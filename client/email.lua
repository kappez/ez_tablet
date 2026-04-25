print("[EMAIL] client/email.lua LOADED")

--====================================
-- GET EMAIL
--====================================
RegisterNUICallback("getEmail", function(_, cb)
    TriggerServerEvent("ez_email:requestEmail")
    cb("ok")
end)

RegisterNetEvent("ez_email:returnEmail", function(data)
    SendNUIMessage({
        type = "emailData",
        email = data.email
    })
end)

--====================================
-- GET INBOX / SENT / TRASH (FIXED)
--====================================
RegisterNUICallback("getInbox", function(data, cb)

    local email = data.email
    local folder = data.folder or "inbox"

    local result = lib.callback.await("ez_email:getInbox", false, {
        email = email,
        folder = folder
    })

    cb(result or {})
end)

--====================================
-- MARK READ
--====================================
RegisterNUICallback("markRead", function(data, cb)
    TriggerServerEvent("ez_email:markRead", data.id)
    cb("ok")
end)

--====================================
-- DELETE EMAIL
--====================================
RegisterNUICallback("markDeleted", function(data, cb)

    print("[EMAIL] delete request received from NUI:", data.id)

    TriggerServerEvent("ez_email:markDeleted", data.id)

    cb("ok")
end)

--====================================
-- RESTORE EMAIL (IMPORTANT - WAS MISSING CLIENT SIDE)
--====================================
RegisterNUICallback("restoreEmail", function(data, cb)

    TriggerServerEvent("ez_email:restoreEmail", data.id)

    cb("ok")
end)

--====================================
-- EMPTY TRASH
--====================================
RegisterNUICallback("emptyTrash", function(data, cb)

    TriggerServerEvent("ez_email:emptyTrash", data.email)

    cb("ok")
end)

--====================================
-- SEND EMAIL
--====================================
RegisterNUICallback("sendReply", function(data, cb)
    TriggerServerEvent("ez_email:sendReply", data)
    cb("ok")
end)
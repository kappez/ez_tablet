print("[EMAIL] client/email.lua LOADED")

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

RegisterNUICallback("getInbox", function(data, cb)
    local inbox = lib.callback.await("ez_email:getInbox", false, data.email)
    cb(inbox)
end)

RegisterNUICallback("markRead", function(data, cb)
    TriggerServerEvent("ez_email:markRead", data.id)
    cb("ok")
end)

RegisterNUICallback("sendReply", function(data, cb)
    TriggerServerEvent("ez_email:sendReply", data)
    cb("ok")
end)
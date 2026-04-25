local tabletOpen = false

--====================================
-- OPEN TABLET (FROM ITEM / COMMAND)
--====================================
RegisterNetEvent("ez_tablet:open", function()

    if tabletOpen then return end

    tabletOpen = true

    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = "open"
    })

    print("[TABLET DEBUG] open event received")
end)

--====================================
-- CLOSE TABLET (FROM NUI)
--====================================
RegisterNUICallback("closeTablet", function(_, cb)

    if not tabletOpen then
        cb("ok")
        return
    end

    tabletOpen = false

    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = "close"
    })

    print("[TABLET DEBUG] tablet closed")

    cb("ok")
end)

--====================================
-- ESC / BACKSPACE HANDLING (CLIENT SIDE SAFETY NET)
--====================================
CreateThread(function()

    while true do
        Wait(0)

        if tabletOpen then

            DisableControlAction(0, 1, true)
            DisableControlAction(0, 2, true)

            -- ESC
            if IsControlJustPressed(0, 322) then
                TriggerEvent("ez_tablet:close")
            end

            -- BACKSPACE
            if IsControlJustPressed(0, 177) then
                TriggerEvent("ez_tablet:close")
            end
        else
            Wait(250)
        end
    end
end)

--====================================
-- INTERNAL CLOSE EVENT (SAFE RESET)
--====================================
RegisterNetEvent("ez_tablet:close", function()

    if not tabletOpen then return end

    tabletOpen = false

    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = "close"
    })

    print("[TABLET DEBUG] closed via keybind/event")
end)
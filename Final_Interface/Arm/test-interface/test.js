var ModelInterval = setInterval(function()
{
	if(Connection.status === Connection.CONNCECTED)
	{
		ModelJSONEditor.set(model);
	}
}, 100);

var MessageInterval = setInterval(function()
{
	if(Connection.status === Connection.CONNCECTED)
	{
		document.querySelector("#messages").innerHTML = messages;
	}
}, 100);

var options = {
    mode: 'code',
    history: false,
    modes: ['code', 'form', 'tree', 'view', 'text'], // allowed modes
    error: function(err) {
        alert(err.toString());
    }
};

var TestEditor = new JSONEditor(document.querySelector("#info"), options);
var ModelJSONEditor = new JSONEditor(document.querySelector("#model"), options);

var arm = {
	"rotunda": 1500,
	"shoulder": 700,
	"elbow": 125,
	"wrist_pitch": 180,
	"wrist_roll": 0,
	"claw": 0,
	"camera_select": 0,
	"rotunda_camera": 0
};

TestEditor.set(arm);

document.querySelector("#send-ctrl-signal").onclick = function()
{
	if(connection)
	{
		var target = document.querySelector("#target").value;
		connection.write(
		{
			target: 'Cortex',
			command: target,
		});
		arm = TestEditor.get();
		var payload = {
			target: target,
			command: arm
		};

		connection.write(payload);
	}
};

function SendPayload(json)
{
	if(connection)
	{
		var target = document.querySelector("#target").value;
		var payload = {
			target: target,
			command: json
		};
		connection.write(payload);
	}
}

// elbow 105 - 145
document.querySelector("#PickUp").onclick = function()
{
	arm.shoulder = 800;
	arm.wrist_pitch = 180;
	SendPayload(arm);
}
document.querySelector("#MidWay").onclick = function()
{
	arm.shoulder = 650;
	arm.wrist_pitch = 265;
	SendPayload(arm);
}
document.querySelector("#ToGround").onclick = function()
{
	arm.shoulder = 590;
	arm.wrist_pitch = 265;
	SendPayload(arm);
}
document.querySelector("#CloseClaw").onclick = function()
{
	arm.claw = 1;
	SendPayload(arm);
}
document.querySelector("#StopClaw").onclick = function()
{
	arm.claw = 0;
	SendPayload(arm);
}
document.querySelector("#OpenClaw").onclick = function()
{
	arm.claw = 2;
	SendPayload(arm);
}
document.querySelector("#RotateBaseOverBox").onclick = function()
{
	SendPayload(arm);
}

// document.querySelector()
// var DriveInterval = setInterval(function()
// {
// 		connection.write(
// 		{
// 			target: 'Cortex',
// 			command: 'DriveSystem',
// 		});
// 		connection.write(
// 		{
// 			target: 'Cortex',
// 			command: 'Arm',
// 		});
// 		clearInterval(DriveInterval);
// 	}
// }, 500);

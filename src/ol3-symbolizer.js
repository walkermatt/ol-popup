var Symbols = {
    "Symbols": [
        {
            "Icons": [
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "_dataType",
                                "Value": "ServiceRequest,serviceRequest"
                            }
                        ]
                    },
                    "id": "ServiceRequest.png",
                    "Width": 0,
                    "Height": 0
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "applicationType.code",
                                "Value": "GISTest"
                            }
                        ]
                    },
                    "id": "Planning_Application.png",
                    "Width": 0,
                    "Height": 0,
                    "template": "app/templates/civics-infoviewer-template"
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "_dataType",
                                "Value": "businessLicense"
                            }
                        ]
                    },
                    "id": "License_Application.png",
                    "Width": 0,
                    "Height": 0
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "_dataType",
                                "Value": "building"
                            }
                        ]
                    },
                    "id": "Building_Review.png",
                    "Width": 0,
                    "Height": 0
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "_dataType",
                                "Value": "project"
                            }
                        ]
                    },
                    "id": "Project_Application.png",
                    "Width": 0,
                    "Height": 0
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "_dataType",
                                "Value": "use"
                            }
                        ]
                    },
                    "id": "Use_Application.png",
                    "Width": 0,
                    "Height": 0
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "_dataType",
                                "Value": "codeEnforcement"
                            }
                        ]
                    },
                    "id": "Case.png",
                    "Width": 0,
                    "Height": 0
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "_dataType",
                                "Value": "tradeLicense"
                            }
                        ]
                    },
                    "id": "trade-license",
                    "type": "style",
                    "style": "{\r\n    \"type\": \"mixed\",\r\n    \"fill\": {\r\n        \"type\": \"sfs\",\r\n        \"style\": \"solid\",\r\n        \"color\": [0, 197, 0, 0.1]\r\n    },\r\n    \"outline\": {\r\n        \"type\": \"sls\",\r\n        \"style\": \"solid\",\r\n        \"color\": [50, 0, 0, 0.5],\r\n        \"width\": 4\r\n     },\r\n    \"image\": {\r\n        \"type\": \"icon\",\r\n        \"icon\": \"Building_Application.png\"\r\n    }\r\n}",
                    "Width": 0,
                    "Height": 0
                },
                {
                    "Filters": {
                        "Filters": [
                            {
                                "id": "type",
                                "Value": "text,address"
                            }
                        ]
                    },
                    "id": "text-only-marker",
                    "type": "style",
                    "style": "{\"type\":\"circle\",\"radius\":7,\"fill\":{\"color\":[247,96,84]}}",
                    "Width": 0,
                    "Height": 0,
                    "Label": "\u003c%= text %\u003e"
                }
            ],
            "id": "*",
            "Label": "\u003c%= portalDescription =\u003e",
            "template": "app/templates/civics-infoviewer-template"
        },
        {
            "Icons": [
                {
                    "id": "*",
                    "type": "style",
                    "style": "{\"type\":\"sfs\",\"style\":\"solid\",\"color\":[246,0,0,0.5],\"outline\":{\"type\":\"sls\",\"style\":\"solid\",\"color\":[246,103,197],\"width\":1}}",
                    "Width": 0,
                    "Height": 0
                }
            ],
            "id": "parcels",
            "Label": "\u003c%= PROPID %\u003e - \u003c%= PROPNAME %\u003e \u003ch6\u003e\u003c%= Comment %\u003e\u003c/h6\u003e"
        }
    ],
    "IconWidth": 0,
    "IconHeight": 0
};
var Symbolizer = (function () {
    function Symbolizer() {
    }
    return Symbolizer;
}());

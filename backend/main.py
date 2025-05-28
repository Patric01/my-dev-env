from fastapi import FastAPI, Response
import uvicorn
from starlette.status import HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST

app = FastAPI()


@app.get("/reservations")
def get_total_reservations():
    return {"reservations": reservations}


@app.post("/reservation")
def add_reservation(reservation: dict, response: Response):
    
    # checking that those 3 required properties are present
    # TODO make the checks more through (data types, no extra properties, times don't overlap...)

    if "user" in reservation and "start" in reservation and "stop" in reservation:
        global current_reservation_id   # must use global variable  :/
        reservation["id"] = current_reservation_id
        current_reservation_id += 1
        reservations.append(reservation)
        return {"reservation": reservation}
    else:
        response.status_code = HTTP_400_BAD_REQUEST
        return {}


@app.delete("/reservation/{id}")
def delete_reservation(id: int, response: Response):
    
    reservation = None
    for re in reservations:
        if re["id"] == id:
            reservation = re
            break

    if reservation:
        reservations.remove(reservation)
    else:
        response.status_code = HTTP_404_NOT_FOUND

    return {}


if __name__ == "__main__":
    
    # No database integration for the moment
    # everything is in memory
    current_reservation_id = 1
    reservations = []

    uvicorn.run(app, host="0.0.0.0", port=8000)

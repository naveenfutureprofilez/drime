import Vector from "../../../public/images/Vector.png"
export default function Download() {
    return (
        <div className="column-center border-apply p-4">
            <img src={Vector} alt="" className="h-12 w-12 object-cover" />
            <h3 className="normal-heading mt-1 ">You received 1 item</h3>
            <p className="normal-para mt-1">4.5 KB - Expires on 12/06/2025 at 23:59</p>
        </div>
    )
}

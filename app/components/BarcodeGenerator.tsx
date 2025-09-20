import Barcode from "react-barcode";
const BarcodeGenerator = ({ uniqueCode }: { uniqueCode: string }) => {
  return (
    <div className="min-w-[350px] text-center">
      {uniqueCode && (
        <div className="bg-white p-2  rounded-lg inline-block shadow-soft">
          <Barcode
            value={uniqueCode}
            format="CODE128"
            width={2.2}
            height={100}
            displayValue={true}
            fontSize={14}
            textMargin={8}
          />
        </div>
      )}
    </div>
  )
}
export default BarcodeGenerator






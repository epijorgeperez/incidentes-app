'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeftIcon } from "lucide-react"
import IncidentForm from "@/components/IncidentForm"
import CollisionForm from "@/components/CollisionForm"

export default function ReportSelector() {
  const [selectedReport, setSelectedReport] = useState<"incident" | "collision" | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleReportSelect = (type: "incident" | "collision") => {
    setSelectedReport(type)
    setIsOpen(true)
  }

  const handleClose = () => {
    setSelectedReport(null)
    setIsOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <p className="text-lg mb-6">Selecciona el tipo de reporte</p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleReportSelect("incident")}
              className="w-full sm:w-auto"
            >
              Reportar Incidente
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleReportSelect("collision")}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Reportar Colisión
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedReport === "incident" ? "Reportar Incidente" : "Reportar Colisión"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-4">
              <div className="mt-4">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="mb-4"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Regresar a selección
                </Button>
                {selectedReport === "incident" ? <IncidentForm /> : <CollisionForm />}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
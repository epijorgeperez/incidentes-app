'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"

export default function CollisionForm() {
  const [file, setFile] = useState<File | null>(null)

  const form = useForm({
    defaultValues: {
      sucursal: "",
      subproceso: "",
      tipo_colision: "",
      fecha: "",
      dias_incapacidad: "",
      atencion_imss: false,
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const onSubmit = (data: any) => {
    console.log({ ...data, report: file })
    // Handle form submission here (e.g., send data to API)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sucursal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sucursal</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subproceso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subproceso</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_colision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Colisión</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fecha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} required />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dias_incapacidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Días de Incapacidad</FormLabel>
              <FormControl>
                <Input type="number" {...field} required />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="atencion_imss"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Atención IMSS</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel htmlFor="report">Upload Report</FormLabel>
          <FormControl>
            <Input id="report" type="file" onChange={handleFileChange} />
          </FormControl>
        </FormItem>

        <Button type="submit" className="w-full">
          Submit Collision Report
        </Button>
      </form>
    </Form>
  )
}
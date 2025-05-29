import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Loader2 } from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../../supabase/supabase";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  avatar_url: string;
  perfil: "solicitante" | "aprovador" | "admin";
  cargo: string;
  departamento: string;
  telefone: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    cargo: "",
    departamento: "",
    telefone: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        nome_completo: data.nome_completo,
        email: data.email,
        cargo: data.cargo || "",
        departamento: data.departamento || "",
        telefone: data.telefone || "",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let avatarUrl = profile?.avatar_url;

      // Upload do novo avatar se houver
      if (avatarFile) {
        const fileName = `${user.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({
          nome_completo: formData.nome_completo,
          cargo: formData.cargo,
          departamento: formData.departamento,
          telefone: formData.telefone,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso.",
      });

      setIsEditing(false);
      setAvatarFile(null);
      await fetchProfile();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Perfil do Usuário
              </h1>
              <p className="text-gray-600">
                Gerencie suas informações pessoais e preferências
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="bg-white mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage
                          src={
                            avatarFile
                              ? URL.createObjectURL(avatarFile)
                              : profile?.avatar_url
                          }
                        />
                        <AvatarFallback>
                          {profile?.nome_completo[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          <Camera className="h-5 w-5" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      )}
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 mt-4">
                      {profile?.nome_completo}
                    </h2>
                    <p className="text-gray-600">{profile?.email}</p>
                    <Badge className="mt-2">
                      {profile?.perfil === "aprovador"
                        ? "Aprovador"
                        : profile?.perfil === "admin"
                          ? "Administrador"
                          : "Solicitante"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="nome_completo">Nome Completo</Label>
                      <Input
                        id="nome_completo"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        name="cargo"
                        value={formData.cargo}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          nome_completo: profile?.nome_completo || "",
                          email: profile?.email || "",
                          cargo: profile?.cargo || "",
                          departamento: profile?.departamento || "",
                          telefone: profile?.telefone || "",
                        });
                        setAvatarFile(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                  </Button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

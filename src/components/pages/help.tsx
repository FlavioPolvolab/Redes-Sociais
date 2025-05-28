import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  HelpCircle,
  Search,
  MessageCircle,
  FileText,
  Video,
  Mail,
  ChevronRight,
  Upload,
  CheckCircle,
  Users,
} from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "Como envio uma nova submissão de conteúdo?",
    answer:
      "Para enviar uma nova submissão, vá para a página 'Submissão' no menu lateral, preencha o título e descrição, faça upload dos seus arquivos e clique em 'Enviar para Aprovação'.",
    category: "Submissão",
  },
  {
    id: "2",
    question: "Quais tipos de arquivo posso enviar?",
    answer:
      "O sistema suporta imagens (JPG, PNG, GIF), vídeos (MP4, MOV, AVI) e documentos PDF. O tamanho máximo por arquivo é de 50MB.",
    category: "Submissão",
  },
  {
    id: "3",
    question: "Como posso acompanhar o status da minha submissão?",
    answer:
      "Você pode acompanhar o status no dashboard principal ou na página de histórico. Você também receberá notificações por email quando houver atualizações.",
    category: "Acompanhamento",
  },
  {
    id: "4",
    question: "O que significa 'Revisão Solicitada'?",
    answer:
      "Quando uma submissão recebe o status 'Revisão Solicitada', significa que o aprovador identificou pontos que precisam ser ajustados antes da aprovação final.",
    category: "Aprovação",
  },
  {
    id: "5",
    question: "Como altero meu perfil de usuário?",
    answer:
      "Vá para a página 'Perfil' no menu lateral, onde você pode atualizar suas informações pessoais, foto e configurações de conta.",
    category: "Conta",
  },
  {
    id: "6",
    question: "Posso editar uma submissão após enviá-la?",
    answer:
      "Após o envio, você não pode editar diretamente a submissão. Se precisar fazer alterações, entre em contato com o aprovador ou aguarde feedback para enviar uma nova versão.",
    category: "Submissão",
  },
];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    "all",
    "Submissão",
    "Aprovação",
    "Acompanhamento",
    "Conta",
  ];

  const filteredFAQ = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Aqui seria implementada a lógica de envio do formulário de contato

      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Nossa equipe entrará em contato em breve.",
      });

      setContactForm({ subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Ajuda" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Central de Ajuda
              </h1>
              <p className="text-gray-600">
                Encontre respostas para suas dúvidas ou entre em contato conosco
              </p>
            </div>

            {/* Cards de Ação Rápida */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Guia de Submissão
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Aprenda como enviar conteúdo para aprovação
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Guia
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Processo de Aprovação
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Entenda como funciona o fluxo de aprovação
                  </p>
                  <Button variant="outline" size="sm">
                    Saiba Mais
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Tutoriais em Vídeo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Assista tutoriais passo a passo
                  </p>
                  <Button variant="outline" size="sm">
                    Assistir
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* FAQ */}
              <div>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5" />
                      <span>Perguntas Frequentes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Busca e Filtros */}
                    <div className="space-y-4 mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar nas perguntas frequentes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Button
                            key={category}
                            variant={
                              selectedCategory === category
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category === "all" ? "Todas" : category}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Lista de FAQ */}
                    <div className="space-y-4">
                      {filteredFAQ.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <ChevronRight className="h-4 w-4 mr-2" />
                            {item.question}
                          </h4>
                          <p className="text-sm text-gray-600">{item.answer}</p>
                        </div>
                      ))}
                    </div>

                    {filteredFAQ.length === 0 && (
                      <div className="text-center py-8">
                        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Nenhuma pergunta encontrada para sua busca.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Formulário de Contato */}
              <div>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5" />
                      <span>Entre em Contato</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input
                          id="subject"
                          placeholder="Descreva brevemente sua dúvida"
                          value={contactForm.subject}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea
                          id="message"
                          placeholder="Descreva sua dúvida ou problema em detalhes..."
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          rows={6}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                      >
                        {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                      </Button>
                    </form>

                    {/* Informações de Contato */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Outras formas de contato
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            suporte@contentflow.com
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Chat ao vivo (9h às 18h)
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Base de conhecimento
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Hr,
  Button,
  Heading,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  salonName: string;
  ownerName: string;
  email: string;
  domainName: string;
  selectedTemplate: string;
  amount: number;
  paymentIntentId: string;
  setupFee: number;
  migrationFee?: number;
  monthlyFee: number;
  hasMigration: boolean;
  orderDate: string;
}

export const OrderConfirmationEmail = ({
  salonName,
  ownerName,
  email,
  domainName,
  selectedTemplate,
  amount,
  paymentIntentId,
  setupFee,
  migrationFee = 0,
  monthlyFee = 49,
  hasMigration = false,
  orderDate,
}: OrderConfirmationEmailProps) => {
  const previewText = `Confirmación de pedido para ${salonName} - PeluqueríasPRO`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>PeluqueríasPRO</Heading>
            <Text style={tagline}>Soluciones web profesionales para peluquerías</Text>
          </Section>

          {/* Success Badge */}
          <Section style={successSection}>
            <div style={successBadge}>
              <Text style={successIcon}>✅</Text>
            </div>
            <Heading style={h2}>¡Pedido Confirmado!</Heading>
            <Text style={paragraph}>
              Hola {ownerName},
            </Text>
            <Text style={paragraph}>
              Hemos recibido correctamente tu pago y estamos emocionados de comenzar a trabajar
              en la página web profesional para <strong>{salonName}</strong>.
            </Text>
          </Section>

          {/* Order Details */}
          <Section style={orderDetailsSection}>
            <Heading style={h3}>Detalles del Pedido</Heading>

            <Row style={tableRow}>
              <Column style={tableLabel}>Número de orden:</Column>
              <Column style={tableValue}>{paymentIntentId}</Column>
            </Row>

            <Row style={tableRow}>
              <Column style={tableLabel}>Fecha:</Column>
              <Column style={tableValue}>{orderDate}</Column>
            </Row>

            <Row style={tableRow}>
              <Column style={tableLabel}>Nombre del negocio:</Column>
              <Column style={tableValue}>{salonName}</Column>
            </Row>

            <Row style={tableRow}>
              <Column style={tableLabel}>Dominio web:</Column>
              <Column style={tableValue}>{domainName}</Column>
            </Row>

            <Row style={tableRow}>
              <Column style={tableLabel}>Plantilla seleccionada:</Column>
              <Column style={tableValue}>{selectedTemplate}</Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Pricing Breakdown */}
          <Section style={pricingSection}>
            <Heading style={h3}>Resumen del Pago</Heading>

            <Row style={tableRow}>
              <Column style={tableLabel}>Setup inicial:</Column>
              <Column style={tablePriceValue}>{setupFee}€</Column>
            </Row>

            <Row style={tableRow}>
              <Column style={tableLabel}>Dominio (primer año):</Column>
              <Column style={tableGreenValue}>Incluido</Column>
            </Row>

            {hasMigration && migrationFee > 0 && (
              <Row style={tableRow}>
                <Column style={tableLabel}>Migración de dominio:</Column>
                <Column style={tablePriceValue}>{migrationFee}€</Column>
              </Row>
            )}

            <Hr style={hrLight} />

            <Row style={totalRow}>
              <Column style={totalLabel}>Total pagado hoy:</Column>
              <Column style={totalValue}>{amount}€</Column>
            </Row>

            <Text style={subscriptionNote}>
              * La mensualidad de {monthlyFee}€ comenzará a cobrarse después de 30 días
            </Text>
          </Section>

          <Hr style={hr} />

          {/* What's Included */}
          <Section style={featuresSection}>
            <Heading style={h3}>Tu paquete incluye:</Heading>

            <div style={featureList}>
              <div style={featureItem}>
                <Text style={featureIcon}>🌐</Text>
                <div>
                  <Text style={featureTitle}>Dominio profesional</Text>
                  <Text style={featureDescription}>Primer año incluido en el precio</Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>⚡</Text>
                <div>
                  <Text style={featureTitle}>Hosting optimizado</Text>
                  <Text style={featureDescription}>Velocidad y rendimiento garantizados</Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>🔒</Text>
                <div>
                  <Text style={featureTitle}>Certificado SSL</Text>
                  <Text style={featureDescription}>Seguridad máxima para tus clientes</Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>💬</Text>
                <div>
                  <Text style={featureTitle}>Soporte técnico 24/7</Text>
                  <Text style={featureDescription}>Siempre disponibles para ayudarte</Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>📱</Text>
                <div>
                  <Text style={featureTitle}>Diseño responsive</Text>
                  <Text style={featureDescription}>Perfecta en móvil, tablet y PC</Text>
                </div>
              </div>

              <div style={featureItem}>
                <Text style={featureIcon}>🎨</Text>
                <div>
                  <Text style={featureTitle}>Personalización completa</Text>
                  <Text style={featureDescription}>Adaptada a tu marca y estilo</Text>
                </div>
              </div>
            </div>
          </Section>

          <Hr style={hr} />

          {/* Next Steps */}
          <Section style={nextStepsSection}>
            <Heading style={h3}>Próximos pasos</Heading>

            <div style={stepList}>
              <div style={stepItem}>
                <div style={stepNumber}>1</div>
                <div>
                  <Text style={stepTitle}>Contacto del equipo (24-48h)</Text>
                  <Text style={stepDescription}>
                    Un especialista se pondrá en contacto contigo para recopilar toda la información
                    necesaria para tu web (logotipo, fotos, servicios, horarios, etc.)
                  </Text>
                </div>
              </div>

              <div style={stepItem}>
                <div style={stepNumber}>2</div>
                <div>
                  <Text style={stepTitle}>Desarrollo y diseño (3-5 días)</Text>
                  <Text style={stepDescription}>
                    Nuestro equipo creará tu página web profesional con todos los elementos
                    que necesitas para atraer más clientes.
                  </Text>
                </div>
              </div>

              <div style={stepItem}>
                <div style={stepNumber}>3</div>
                <div>
                  <Text style={stepTitle}>Revisión y lanzamiento</Text>
                  <Text style={stepDescription}>
                    Te enviaremos un enlace de previsualización para que apruebes el diseño.
                    Una vez aprobado, publicaremos tu web y te entregaremos todos los accesos.
                  </Text>
                </div>
              </div>
            </div>
          </Section>

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              Mientras tanto, puedes preparar el contenido que quieras incluir en tu web:
            </Text>
            <Button
              href="https://peluqueriaspro.com/preparar-contenido"
              style={button}
            >
              Ver guía de preparación
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Support Section */}
          <Section style={supportSection}>
            <Heading style={h4}>¿Necesitas ayuda?</Heading>
            <Text style={paragraph}>
              Estamos aquí para ayudarte. No dudes en contactarnos si tienes cualquier pregunta.
            </Text>

            <div style={contactInfo}>
              <Text style={contactItem}>
                📧 Email: <Link href="mailto:soporte@peluqueriaspro.com" style={link}>
                  soporte@peluqueriaspro.com
                </Link>
              </Text>
              <Text style={contactItem}>
                💬 WhatsApp: <Link href="https://wa.me/34600000000" style={link}>
                  +34 600 00 00 00
                </Link>
              </Text>
              <Text style={contactItem}>
                🌐 Web: <Link href="https://peluqueriaspro.com" style={link}>
                  peluqueriaspro.com
                </Link>
              </Text>
            </div>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 PeluqueríasPRO. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              Este email fue enviado a {email} porque realizaste una compra en nuestra web.
            </Text>
            <div style={footerLinks}>
              <Link href="https://peluqueriaspro.com/terminos" style={footerLink}>
                Términos y Condiciones
              </Link>
              {' | '}
              <Link href="https://peluqueriaspro.com/privacidad" style={footerLink}>
                Política de Privacidad
              </Link>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 32px 24px',
  backgroundColor: '#1e40af',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const tagline = {
  color: '#dbeafe',
  fontSize: '14px',
  margin: '8px 0 0 0',
};

const successSection = {
  padding: '32px',
  textAlign: 'center' as const,
};

const successBadge = {
  display: 'inline-block',
  marginBottom: '16px',
};

const successIcon = {
  fontSize: '48px',
  margin: '0',
};

const h2 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const h4 = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const paragraph = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const orderDetailsSection = {
  padding: '0 32px 32px',
};

const tableRow = {
  marginBottom: '12px',
};

const tableLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'normal',
  width: '45%',
};

const tableValue = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 'bold',
  width: '55%',
};

const pricingSection = {
  padding: '32px',
  backgroundColor: '#f9fafb',
};

const tablePriceValue = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  width: '55%',
};

const tableGreenValue = {
  color: '#10b981',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  width: '55%',
};

const totalRow = {
  marginTop: '16px',
  paddingTop: '16px',
};

const totalLabel = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: 'bold',
  width: '45%',
};

const totalValue = {
  color: '#1e40af',
  fontSize: '20px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  width: '55%',
};

const subscriptionNote = {
  color: '#6b7280',
  fontSize: '12px',
  fontStyle: 'italic',
  marginTop: '12px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const hrLight = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const featuresSection = {
  padding: '0 32px 32px',
};

const featureList = {
  marginTop: '24px',
};

const featureItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const featureIcon = {
  fontSize: '24px',
  marginRight: '16px',
  minWidth: '32px',
};

const featureTitle = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
};

const nextStepsSection = {
  padding: '0 32px 32px',
};

const stepList = {
  marginTop: '24px',
};

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '24px',
};

const stepNumber = {
  backgroundColor: '#1e40af',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '16px',
  flexShrink: 0,
};

const stepTitle = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const stepDescription = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

const ctaSection = {
  padding: '32px',
  backgroundColor: '#eff6ff',
  textAlign: 'center' as const,
};

const ctaText = {
  color: '#1e40af',
  fontSize: '16px',
  marginBottom: '20px',
};

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const supportSection = {
  padding: '0 32px 32px',
  textAlign: 'center' as const,
};

const contactInfo = {
  marginTop: '20px',
};

const contactItem = {
  color: '#6b7280',
  fontSize: '14px',
  marginBottom: '8px',
};

const link = {
  color: '#1e40af',
  textDecoration: 'underline',
};

const footer = {
  padding: '32px',
  backgroundColor: '#f9fafb',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 8px',
};

const footerLinks = {
  marginTop: '12px',
};

const footerLink = {
  color: '#6b7280',
  fontSize: '12px',
  textDecoration: 'underline',
};

export default OrderConfirmationEmail;
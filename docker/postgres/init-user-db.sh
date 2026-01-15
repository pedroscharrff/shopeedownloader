#!/bin/bash
set -e

# Configurar pg_hba.conf para permitir conexões externas com trust (desenvolvimento)
echo "host all all all trust" >> /var/lib/postgresql/data/pg_hba.conf

# Recarregar configuração
pg_ctl reload -D /var/lib/postgresql/data
